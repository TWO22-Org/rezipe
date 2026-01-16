import SwiftUI

/// Centralized theme definitions for ChefStream app
enum Theme {
    /// Color definitions using asset catalog colors with light/dark mode support
    enum Colors {
        static let primary = Color("BrandPrimary")
        static let secondary = Color("BrandSecondary")
        static let background = Color("BackgroundColor")
    }

    /// Typography definitions using system fonts
    enum Typography {
        static let title = Font.title
        static let headline = Font.headline
        static let body = Font.body
        static let caption = Font.caption
    }

    /// Spacing constants for consistent layout
    enum Spacing {
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
    }
}
