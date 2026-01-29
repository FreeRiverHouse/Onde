// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WhisperFlowApp",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "WhisperFlowApp", targets: ["WhisperFlowApp"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "WhisperFlowApp",
            dependencies: [],
            path: "Sources/WhisperFlowApp"
        )
    ]
)
