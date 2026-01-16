import XCTest
import SwiftUI
@testable import ChefStream

final class ChefStreamTests: XCTestCase {

    // MARK: - App Shell Structure Tests

    func testChefStreamAppInstantiates() throws {
        let app = ChefStreamApp()
        XCTAssertNotNil(app, "ChefStreamApp should instantiate successfully")
    }

    // MARK: - Tab Navigation Tests

    func testMainTabViewInstantiates() throws {
        let view = MainTabView()
        XCTAssertNotNil(view, "MainTabView should instantiate successfully")
    }

    func testMainTabViewBodyIsAccessible() throws {
        let view = MainTabView()
        let body = view.body
        XCTAssertNotNil(body, "MainTabView body should be accessible")
    }

    func testTabEnumHasExpectedCases() throws {
        // Verify Tab enum has both expected cases
        let homeTab = MainTabView.Tab.home
        let searchTab = MainTabView.Tab.search
        XCTAssertNotEqual(homeTab, searchTab, "Tab cases should be distinct")
        // Note: Default tab selection (home) should be verified via UI tests
    }

    // MARK: - Home View Tests

    func testHomeViewInstantiates() throws {
        let view = HomeView()
        XCTAssertNotNil(view, "HomeView should instantiate successfully")
    }

    func testHomeViewBodyIsAccessible() throws {
        let view = HomeView()
        let body = view.body
        XCTAssertNotNil(body, "HomeView body should be accessible")
    }

    // MARK: - Search View Tests

    func testSearchViewInstantiates() throws {
        let view = SearchView()
        XCTAssertNotNil(view, "SearchView should instantiate successfully")
    }

    func testSearchViewBodyIsAccessible() throws {
        let view = SearchView()
        let body = view.body
        XCTAssertNotNil(body, "SearchView body should be accessible")
    }
}
