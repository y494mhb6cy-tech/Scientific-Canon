import SwiftUI

enum CanonColors {
    // Background
    static let backgroundPrimary = Color(hex: 0x0D1117)
    static let backgroundSecondary = Color(hex: 0x010409)

    // Frame (F) — cyan/blue
    static let frameLight = Color(hex: 0x79C0FF)
    static let frameMid = Color(hex: 0x58A6FF)
    static let frameDark = Color(hex: 0x1F6FEB)

    // Gradient (G) — amber/gold
    static let gradientLight = Color(hex: 0xE3B341)
    static let gradientMid = Color(hex: 0xD29922)
    static let gradientDark = Color(hex: 0xF0883E)

    // Vector (V) — magenta/purple
    static let vectorLight = Color(hex: 0xBC8CFF)
    static let vectorMid = Color(hex: 0xA371F7)
    static let vectorDark = Color(hex: 0x8957E5)

    // Xi / Coherence — white/gray
    static let xiPrimary = Color(hex: 0xF0F6FC)
    static let xiSecondary = Color(hex: 0xC9D1D9)
    static let xiTertiary = Color(hex: 0x8B949E)

    // Structural
    static let border = Color(hex: 0x30363D)
    static let borderSubtle = Color(hex: 0x21262D)
    static let surfaceRaised = Color(hex: 0x161B22)

    // Collapse / Warning
    static let collapse = Color(hex: 0xF85149)
}

extension Color {
    init(hex: UInt, opacity: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: opacity
        )
    }
}
