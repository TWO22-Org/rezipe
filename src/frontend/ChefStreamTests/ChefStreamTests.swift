import XCTest
import SwiftUI
@testable import ChefStream

final class ChefStreamTests: XCTestCase {

    // MARK: - App Shell Structure Tests

    func testContentViewInstantiates() throws {
        // Verify ContentView can be created without crashing
        let view = ContentView()
        XCTAssertNotNil(view, "ContentView should instantiate successfully")
    }

    func testContentViewBodyIsAccessible() throws {
        // Verify ContentView body property is accessible (SwiftUI view hierarchy exists)
        let view = ContentView()
        let body = view.body
        XCTAssertNotNil(body, "ContentView body should be accessible")
    }

    func testChefStreamAppInstantiates() throws {
        // Verify the main App struct can be created
        let app = ChefStreamApp()
        XCTAssertNotNil(app, "ChefStreamApp should instantiate successfully")
    }
}
