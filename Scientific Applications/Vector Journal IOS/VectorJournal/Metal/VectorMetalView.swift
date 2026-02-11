import SwiftUI
import MetalKit

/// UIViewRepresentable wrapper for MTKView, bridging Metal into SwiftUI.
struct VectorMetalView: UIViewRepresentable {
    let renderData: [VectorRenderData]

    func makeUIView(context: Context) -> MTKView {
        let mtkView = MTKView()
        mtkView.device = MTLCreateSystemDefaultDevice()
        mtkView.clearColor = MTLClearColor(red: 0.051, green: 0.067, blue: 0.090, alpha: 1.0)
        mtkView.colorPixelFormat = .bgra8Unorm
        mtkView.isPaused = true
        mtkView.enableSetNeedsDisplay = true
        mtkView.isOpaque = true
        mtkView.backgroundColor = UIColor(red: 0.051, green: 0.067, blue: 0.090, alpha: 1.0)

        if let renderer = VectorFieldRenderer(mtkView: mtkView) {
            context.coordinator.renderer = renderer
            renderer.arcs = renderData
            mtkView.setNeedsDisplay()
        }

        return mtkView
    }

    func updateUIView(_ mtkView: MTKView, context: Context) {
        context.coordinator.renderer?.arcs = renderData
        mtkView.setNeedsDisplay()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    final class Coordinator {
        var renderer: VectorFieldRenderer?
    }
}
