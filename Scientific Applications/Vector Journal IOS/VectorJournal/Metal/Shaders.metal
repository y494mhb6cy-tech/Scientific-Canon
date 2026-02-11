#include <metal_stdlib>
using namespace metal;

// MARK: - Vertex types

struct VertexIn {
    float2 position [[attribute(0)]];
    float4 color    [[attribute(1)]];
    float  opacity  [[attribute(2)]];
};

struct VertexOut {
    float4 position [[position]];
    float4 color;
};

struct Uniforms {
    float2 viewportSize;
};

// MARK: - Vector arc shaders

vertex VertexOut vectorVertex(
    VertexIn in [[stage_in]],
    constant Uniforms &uniforms [[buffer(1)]]
) {
    VertexOut out;
    // Map normalized coordinates (-1..1) to clip space
    out.position = float4(in.position, 0.0, 1.0);
    out.color = float4(in.color.rgb, in.color.a * in.opacity);
    return out;
}

fragment float4 vectorFragment(VertexOut in [[stage_in]]) {
    return in.color;
}

// MARK: - Anchor node shaders (instanced circles with glow)

struct AnchorVertexIn {
    float2 position [[attribute(0)]];
};

struct AnchorInstanceIn {
    float2 center;
    float4 color;
    float  radius;
};

struct AnchorVertexOut {
    float4 position [[position]];
    float4 color;
    float2 localPos; // relative to center, for circle SDF
    float  radius;
};

vertex AnchorVertexOut anchorVertex(
    AnchorVertexIn in [[stage_in]],
    constant AnchorInstanceIn *instances [[buffer(1)]],
    uint instanceID [[instance_id]]
) {
    AnchorInstanceIn inst = instances[instanceID];
    AnchorVertexOut out;

    float2 worldPos = inst.center + in.position * inst.radius;
    out.position = float4(worldPos, 0.0, 1.0);
    out.color = inst.color;
    out.localPos = in.position;
    out.radius = inst.radius;

    return out;
}

fragment float4 anchorFragment(AnchorVertexOut in [[stage_in]]) {
    float dist = length(in.localPos);

    // Hard circle edge
    float circle = 1.0 - smoothstep(0.7, 0.75, dist);

    // Glow ring
    float glow = smoothstep(1.0, 0.5, dist) * 0.3;

    // Inner dot
    float inner = 1.0 - smoothstep(0.15, 0.2, dist);

    float alpha = max(circle * 0.5, max(glow, inner));
    return float4(in.color.rgb, alpha * in.color.a);
}

// MARK: - Xi center symbol shader

struct XiVertexIn {
    float2 position [[attribute(0)]];
    float4 color    [[attribute(1)]];
};

struct XiVertexOut {
    float4 position [[position]];
    float4 color;
};

vertex XiVertexOut xiVertex(
    XiVertexIn in [[stage_in]]
) {
    XiVertexOut out;
    out.position = float4(in.position, 0.0, 1.0);
    out.color = in.color;
    return out;
}

fragment float4 xiFragment(XiVertexOut in [[stage_in]]) {
    return in.color;
}

// MARK: - Co-dependence bond shaders (dashed arcs)

vertex VertexOut bondVertex(
    VertexIn in [[stage_in]],
    constant Uniforms &uniforms [[buffer(1)]]
) {
    VertexOut out;
    out.position = float4(in.position, 0.0, 1.0);
    out.color = float4(in.color.rgb, in.color.a * in.opacity * 0.4);
    return out;
}

fragment float4 bondFragment(VertexOut in [[stage_in]]) {
    return in.color;
}
