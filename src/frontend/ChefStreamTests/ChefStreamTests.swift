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
        let homeTab = MainTabView.Tab.home
        let searchTab = MainTabView.Tab.search
        XCTAssertNotEqual(homeTab, searchTab, "Tab cases should be distinct")
    }

    // MARK: - Video Detail View Tests

    func testVideoDetailViewInstantiates() throws {
        let view = VideoDetailView(videoId: "test-video-123")
        XCTAssertNotNil(view, "VideoDetailView should instantiate successfully")
    }

    func testVideoDetailViewBodyIsAccessible() throws {
        let view = VideoDetailView(videoId: "test-video-123")
        let body = view.body
        XCTAssertNotNil(body, "VideoDetailView body should be accessible")
    }

    func testVideoDetailViewAcceptsVideoId() throws {
        let videoId = "my-test-video"
        let view = VideoDetailView(videoId: videoId)
        XCTAssertEqual(view.videoId, videoId, "VideoDetailView should store the provided videoId")
    }

    // MARK: - Navigation Path Preservation Tests

    func testNavigationPathCanBeCreated() throws {
        let path = NavigationPath()
        XCTAssertTrue(path.isEmpty, "New NavigationPath should be empty")
    }

    func testNavigationPathCanAppendValues() throws {
        var path = NavigationPath()
        path.append("video-123")
        XCTAssertFalse(path.isEmpty, "NavigationPath should not be empty after append")
        XCTAssertEqual(path.count, 1, "NavigationPath should have one element")
    }
}
