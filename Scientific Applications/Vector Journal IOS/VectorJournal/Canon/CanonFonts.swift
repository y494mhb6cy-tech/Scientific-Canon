import SwiftUI

enum CanonFonts {
    static func mono(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }

    static let title = mono(24, weight: .semibold)
    static let heading = mono(18, weight: .semibold)
    static let body = mono(15)
    static let caption = mono(12)
    static let label = mono(11, weight: .medium)
    static let glyph = mono(20, weight: .semibold)
}
