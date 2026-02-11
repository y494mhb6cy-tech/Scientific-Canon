import MetalKit
import simd

/// Metal renderer for the canonical vector field visualization.
/// Draws anchor nodes, Xi center, co-dependence bonds, and vector arcs.
final class VectorFieldRenderer: NSObject, MTKViewDelegate {
    private let device: MTLDevice
    private let commandQueue: MTLCommandQueue

    // Pipeline states
    private var arcPipelineState: MTLRenderPipelineState!
    private var anchorPipelineState: MTLRenderPipelineState!
    private var xiPipelineState: MTLRenderPipelineState!
    private var bondPipelineState: MTLRenderPipelineState!

    // Vertex descriptors
    private var arcVertexDescriptor: MTLVertexDescriptor!

    // Static geometry
    private var anchorQuadBuffer: MTLBuffer!
    private var anchorInstanceBuffer: MTLBuffer!
    private var xiVertexBuffer: MTLBuffer!
    private var bondVertexBuffers: [MTLBuffer] = []

    // Dynamic data
    var arcs: [VectorRenderData] = [] {
        didSet { rebuildArcBuffers() }
    }
    private var arcVertexBuffers: [MTLBuffer] = []

    // Background color matching canonical glyph
    private let clearColor = MTLClearColor(red: 0.051, green: 0.067, blue: 0.090, alpha: 1.0) // #0d1117

    init?(mtkView: MTKView) {
        guard let device = mtkView.device ?? MTLCreateSystemDefaultDevice() else { return nil }
        self.device = device
        mtkView.device = device

        guard let queue = device.makeCommandQueue() else { return nil }
        self.commandQueue = queue

        super.init()

        mtkView.clearColor = clearColor
        mtkView.colorPixelFormat = .bgra8Unorm
        mtkView.delegate = self
        mtkView.isPaused = false
        mtkView.enableSetNeedsDisplay = true

        guard buildPipelines(mtkView: mtkView) else { return nil }
        buildStaticGeometry()
    }

    // MARK: - Pipeline Setup

    private func buildPipelines(mtkView: MTKView) -> Bool {
        guard let library = device.makeDefaultLibrary() else { return false }

        // Arc pipeline
        let arcDesc = MTLRenderPipelineDescriptor()
        arcDesc.vertexFunction = library.makeFunction(name: "vectorVertex")
        arcDesc.fragmentFunction = library.makeFunction(name: "vectorFragment")
        arcDesc.colorAttachments[0].pixelFormat = mtkView.colorPixelFormat
        arcDesc.colorAttachments[0].isBlendingEnabled = true
        arcDesc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        arcDesc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        arcDesc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        arcDesc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha

        // Vertex descriptor for arcs
        let vd = MTLVertexDescriptor()
        // position: float2
        vd.attributes[0].format = .float2
        vd.attributes[0].offset = 0
        vd.attributes[0].bufferIndex = 0
        // color: float4
        vd.attributes[1].format = .float4
        vd.attributes[1].offset = MemoryLayout<SIMD2<Float>>.stride
        vd.attributes[1].bufferIndex = 0
        // opacity: float
        vd.attributes[2].format = .float
        vd.attributes[2].offset = MemoryLayout<SIMD2<Float>>.stride + MemoryLayout<SIMD4<Float>>.stride
        vd.attributes[2].bufferIndex = 0
        // layout
        vd.layouts[0].stride = MemoryLayout<VectorArcVertex>.stride
        vd.layouts[0].stepRate = 1
        vd.layouts[0].stepFunction = .perVertex

        arcDesc.vertexDescriptor = vd
        arcVertexDescriptor = vd

        guard let arcPSO = try? device.makeRenderPipelineState(descriptor: arcDesc) else { return false }
        arcPipelineState = arcPSO

        // Anchor pipeline
        let anchorDesc = MTLRenderPipelineDescriptor()
        anchorDesc.vertexFunction = library.makeFunction(name: "anchorVertex")
        anchorDesc.fragmentFunction = library.makeFunction(name: "anchorFragment")
        anchorDesc.colorAttachments[0].pixelFormat = mtkView.colorPixelFormat
        anchorDesc.colorAttachments[0].isBlendingEnabled = true
        anchorDesc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        anchorDesc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        anchorDesc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        anchorDesc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha

        let avd = MTLVertexDescriptor()
        avd.attributes[0].format = .float2
        avd.attributes[0].offset = 0
        avd.attributes[0].bufferIndex = 0
        avd.layouts[0].stride = MemoryLayout<SIMD2<Float>>.stride
        anchorDesc.vertexDescriptor = avd

        guard let anchorPSO = try? device.makeRenderPipelineState(descriptor: anchorDesc) else { return false }
        anchorPipelineState = anchorPSO

        // Xi pipeline (reuse arc pipeline for simplicity — same vertex format)
        let xiDesc = MTLRenderPipelineDescriptor()
        xiDesc.vertexFunction = library.makeFunction(name: "xiVertex")
        xiDesc.fragmentFunction = library.makeFunction(name: "xiFragment")
        xiDesc.colorAttachments[0].pixelFormat = mtkView.colorPixelFormat
        xiDesc.colorAttachments[0].isBlendingEnabled = true
        xiDesc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        xiDesc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        xiDesc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        xiDesc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha

        let xvd = MTLVertexDescriptor()
        xvd.attributes[0].format = .float2
        xvd.attributes[0].offset = 0
        xvd.attributes[0].bufferIndex = 0
        xvd.attributes[1].format = .float4
        xvd.attributes[1].offset = MemoryLayout<SIMD2<Float>>.stride
        xvd.attributes[1].bufferIndex = 0
        xvd.layouts[0].stride = MemoryLayout<SIMD2<Float>>.stride + MemoryLayout<SIMD4<Float>>.stride
        xiDesc.vertexDescriptor = xvd

        guard let xiPSO = try? device.makeRenderPipelineState(descriptor: xiDesc) else { return false }
        xiPipelineState = xiPSO

        // Bond pipeline (reuses arc shaders)
        let bondDesc = MTLRenderPipelineDescriptor()
        bondDesc.vertexFunction = library.makeFunction(name: "bondVertex")
        bondDesc.fragmentFunction = library.makeFunction(name: "bondFragment")
        bondDesc.colorAttachments[0].pixelFormat = mtkView.colorPixelFormat
        bondDesc.colorAttachments[0].isBlendingEnabled = true
        bondDesc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        bondDesc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        bondDesc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        bondDesc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha
        bondDesc.vertexDescriptor = vd

        guard let bondPSO = try? device.makeRenderPipelineState(descriptor: bondDesc) else { return false }
        bondPipelineState = bondPSO

        return true
    }

    // MARK: - Static Geometry

    private func buildStaticGeometry() {
        // Anchor quad (unit square, scaled per instance)
        let quad: [SIMD2<Float>] = [
            SIMD2(-1, -1), SIMD2(1, -1), SIMD2(-1, 1),
            SIMD2(-1, 1), SIMD2(1, -1), SIMD2(1, 1)
        ]
        anchorQuadBuffer = device.makeBuffer(
            bytes: quad,
            length: MemoryLayout<SIMD2<Float>>.stride * quad.count,
            options: .storageModeShared
        )

        // Anchor instances
        let positions = ArcGeometry.anchorPositions()
        let colors = ArcGeometry.anchorColors()
        var instances: [AnchorInstance] = []
        for i in 0..<3 {
            instances.append(AnchorInstance(
                center: positions[i],
                color: colors[i],
                radius: 0.06
            ))
        }
        anchorInstanceBuffer = device.makeBuffer(
            bytes: instances,
            length: MemoryLayout<AnchorInstance>.stride * instances.count,
            options: .storageModeShared
        )

        // Xi center — three horizontal bars
        buildXiGeometry()

        // Co-dependence bonds
        buildBondGeometry()
    }

    private func buildXiGeometry() {
        struct XiVertex {
            var position: SIMD2<Float>
            var color: SIMD4<Float>
        }

        let white = SIMD4<Float>(0.94, 0.96, 0.99, 1.0)
        let gray = SIMD4<Float>(0.788, 0.82, 0.85, 1.0)
        let barHeight: Float = 0.008
        let widths: [Float] = [0.05, 0.04, 0.05]
        let yPositions: [Float] = [0.03, 0.0, -0.03]
        let barColors = [white, gray, white]

        var vertices: [XiVertex] = []
        for i in 0..<3 {
            let w = widths[i]
            let y = yPositions[i]
            let c = barColors[i]
            // Two triangles per bar
            vertices.append(contentsOf: [
                XiVertex(position: SIMD2(-w, y - barHeight), color: c),
                XiVertex(position: SIMD2(w, y - barHeight), color: c),
                XiVertex(position: SIMD2(-w, y + barHeight), color: c),
                XiVertex(position: SIMD2(-w, y + barHeight), color: c),
                XiVertex(position: SIMD2(w, y - barHeight), color: c),
                XiVertex(position: SIMD2(w, y + barHeight), color: c),
            ])
        }

        xiVertexBuffer = device.makeBuffer(
            bytes: vertices,
            length: MemoryLayout<XiVertex>.stride * vertices.count,
            options: .storageModeShared
        )
    }

    private func buildBondGeometry() {
        let anchors = ArcGeometry.anchorPositions()
        let colors = ArcGeometry.anchorColors()
        let pairs = [(0, 1), (1, 2), (2, 0)]

        bondVertexBuffers = pairs.enumerated().map { idx, pair in
            let from = anchors[pair.0]
            let to = anchors[pair.1]
            let color = colors[pair.0]

            let vertices = ArcGeometry.tessellateArc(
                from: from,
                to: to,
                curvature: 0.2,
                weights: SIMD3<Float>(repeating: 1.0 / 3.0),
                anchors: anchors,
                opacity: 0.4,
                segments: 32
            )
            // Override colors for bonds
            let bondVertices = vertices.map { v in
                VectorArcVertex(position: v.position, color: color, opacity: 0.3)
            }

            return device.makeBuffer(
                bytes: bondVertices,
                length: MemoryLayout<VectorArcVertex>.stride * bondVertices.count,
                options: .storageModeShared
            )!
        }
    }

    private func rebuildArcBuffers() {
        arcVertexBuffers = arcs.compactMap { renderData in
            guard !renderData.vertices.isEmpty else { return nil }
            return device.makeBuffer(
                bytes: renderData.vertices,
                length: MemoryLayout<VectorArcVertex>.stride * renderData.vertices.count,
                options: .storageModeShared
            )
        }
    }

    // MARK: - MTKViewDelegate

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        // Viewport resize — no action needed for normalized coords
    }

    func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let passDescriptor = view.currentRenderPassDescriptor,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: passDescriptor)
        else { return }

        var uniforms = VectorUniforms(
            viewportSize: SIMD2<Float>(Float(view.drawableSize.width), Float(view.drawableSize.height))
        )

        // 1. Draw co-dependence bonds
        encoder.setRenderPipelineState(bondPipelineState)
        for (i, buffer) in bondVertexBuffers.enumerated() {
            encoder.setVertexBuffer(buffer, offset: 0, index: 0)
            encoder.setVertexBytes(&uniforms, length: MemoryLayout<VectorUniforms>.stride, index: 1)
            let count = bondVertexBuffers[i].length / MemoryLayout<VectorArcVertex>.stride
            encoder.drawPrimitives(type: .lineStrip, vertexStart: 0, vertexCount: count)
        }

        // 2. Draw anchor nodes
        if let quadBuf = anchorQuadBuffer, let instBuf = anchorInstanceBuffer {
            encoder.setRenderPipelineState(anchorPipelineState)
            encoder.setVertexBuffer(quadBuf, offset: 0, index: 0)
            encoder.setVertexBuffer(instBuf, offset: 0, index: 1)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 6, instanceCount: 3)
        }

        // 3. Draw Xi center
        if let xiBuf = xiVertexBuffer {
            encoder.setRenderPipelineState(xiPipelineState)
            encoder.setVertexBuffer(xiBuf, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 18) // 3 bars × 6 verts
        }

        // 4. Draw vector arcs
        encoder.setRenderPipelineState(arcPipelineState)
        for (i, buffer) in arcVertexBuffers.enumerated() {
            encoder.setVertexBuffer(buffer, offset: 0, index: 0)
            encoder.setVertexBytes(&uniforms, length: MemoryLayout<VectorUniforms>.stride, index: 1)
            let count = arcs[i].vertices.count
            encoder.drawPrimitives(type: .lineStrip, vertexStart: 0, vertexCount: count)
        }

        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}

// MARK: - Metal-aligned anchor instance

struct AnchorInstance {
    var center: SIMD2<Float>
    var color: SIMD4<Float>
    var radius: Float
    var _pad: Float = 0
}
