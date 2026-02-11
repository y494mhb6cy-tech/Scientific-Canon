import simd

/// Vertex format for vector arcs rendered in Metal.
struct VectorArcVertex {
    var position: SIMD2<Float>
    var color: SIMD4<Float>
    var opacity: Float

    // Padding for Metal alignment (16-byte)
    var _pad: SIMD3<Float> = .zero
}

/// Data prepared per-arc for the renderer.
struct VectorRenderData {
    let vertices: [VectorArcVertex]
    
    let coherence: Float
}

/// Uniform buffer passed to vertex shader.
struct VectorUniforms {
    var viewportSize: SIMD2<Float>
}
