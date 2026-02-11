import Foundation

/// Thread-safe HTTP client for OpenAI API calls via backend proxy.
/// The app never holds the API key directly.
actor OpenAIClient {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = URL(string: "https://api.vectorjournal.app/v1")!) {
        self.baseURL = baseURL
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    // MARK: - Vector Analysis

    func analyzeVector(
        entryBody: String,
        contextTag: String?,
        references: [String]
    ) async throws -> VectorAnalysisResponse {
        guard references.count == 3 else {
            throw OpenAIError.invalidReferences
        }

        let contextLine = contextTag.map { "Context tag: \($0)" } ?? ""

        let userMessage = """
        Analyze the following journal entry relative to these three primary references:
        1. \(references[0])
        2. \(references[1])
        3. \(references[2])

        Entry text:
        "\(entryBody)"

        \(contextLine)

        Respond with JSON matching this schema:
        {
          "references": [
            {"name": string, "weight": float (0.0-1.0)},
            {"name": string, "weight": float (0.0-1.0)},
            {"name": string, "weight": float (0.0-1.0)}
          ],
          "orientation": {
            "angle": float (0.0-6.283, radians),
            "magnitude": float (0.0-1.0)
          },
          "coherence": float (0.0-1.0),
          "drift": {
            "curvature": float,
            "timescale": "entry" | "week" | "month"
          },
          "function_used": "describe_direction"
        }
        """

        let request = ChatCompletionRequest(
            model: "gpt-4o",
            messages: [
                .init(role: "system", content: SystemPrompt.canonEnforced),
                .init(role: "user", content: userMessage)
            ],
            responseFormat: .init(type: "json_object")
        )

        let data = try await post(path: "/analyze", body: request)
        let completion = try JSONDecoder().decode(ChatCompletionResponse.self, from: data)

        guard let content = completion.choices.first?.message.content else {
            throw OpenAIError.emptyResponse
        }

        guard let jsonData = content.data(using: .utf8) else {
            throw OpenAIError.invalidJSON
        }

        return try JSONDecoder().decode(VectorAnalysisResponse.self, from: jsonData)
    }

    // MARK: - Perspective Generation

    func generatePerspective(
        entryBody: String,
        references: [String],
        weights: [Float],
        angle: Float,
        magnitude: Float,
        coherence: Float,
        curvature: Float,
        recentContext: String?
    ) async throws -> PerspectiveResponse {
        let recentLine = recentContext ?? ""

        let userMessage = """
        Given the following vector analysis and journal entry, provide a brief \
        descriptive perspective. Use ONLY the permitted function indicated.

        References: \(references[0]) (weight: \(weights[0])), \(references[1]) (weight: \(weights[1])), \(references[2]) (weight: \(weights[2]))
        Orientation angle: \(angle), magnitude: \(magnitude)
        Coherence: \(coherence)
        Drift curvature: \(curvature)

        Entry: "\(entryBody)"

        \(recentLine)

        Select the most appropriate function and respond with JSON:
        {
          "function_used": "describe_alignment_change" | "describe_dispersion" | "describe_internal_tension",
          "perspective": string (2-4 sentences, descriptive only, no advice)
        }
        """

        let request = ChatCompletionRequest(
            model: "gpt-4o",
            messages: [
                .init(role: "system", content: SystemPrompt.canonEnforced),
                .init(role: "user", content: userMessage)
            ],
            responseFormat: .init(type: "json_object")
        )

        let data = try await post(path: "/perspective", body: request)
        let completion = try JSONDecoder().decode(ChatCompletionResponse.self, from: data)

        guard let content = completion.choices.first?.message.content else {
            throw OpenAIError.emptyResponse
        }

        guard let jsonData = content.data(using: .utf8) else {
            throw OpenAIError.invalidJSON
        }

        return try JSONDecoder().decode(PerspectiveResponse.self, from: jsonData)
    }

    // MARK: - HTTP

    private func post<T: Encodable>(path: String, body: T) async throws -> Data {
        var urlRequest = URLRequest(url: baseURL.appendingPathComponent(path))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw OpenAIError.httpError(statusCode: httpResponse.statusCode)
        }

        return data
    }
}

// MARK: - Request/Response Types

struct ChatCompletionRequest: Encodable {
    let model: String
    let messages: [ChatMessage]
    let responseFormat: ResponseFormat

    enum CodingKeys: String, CodingKey {
        case model, messages
        case responseFormat = "response_format"
    }

    struct ResponseFormat: Encodable {
        let type: String
    }
}

struct ChatMessage: Codable {
    let role: String
    let content: String
}

struct ChatCompletionResponse: Decodable {
    let choices: [Choice]

    struct Choice: Decodable {
        let message: Message
    }

    struct Message: Decodable {
        let content: String?
    }
}

struct VectorAnalysisResponse: Decodable {
    let references: [ReferenceWeight]
    let orientation: Orientation
    let coherence: Float
    let drift: Drift

    struct ReferenceWeight: Decodable {
        let name: String
        let weight: Float
    }

    struct Orientation: Decodable {
        let angle: Float
        let magnitude: Float
    }

    struct Drift: Decodable {
        let curvature: Float
        let timescale: String
    }
}

struct PerspectiveResponse: Decodable {
    let function_used: String
    let perspective: String
}

enum OpenAIError: Error, LocalizedError {
    case invalidReferences
    case emptyResponse
    case invalidJSON
    case invalidResponse
    case httpError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidReferences: return "Exactly 3 references required."
        case .emptyResponse: return "Empty response from analysis."
        case .invalidJSON: return "Invalid response format."
        case .invalidResponse: return "Invalid HTTP response."
        case .httpError(let code): return "HTTP error: \(code)"
        }
    }
}
