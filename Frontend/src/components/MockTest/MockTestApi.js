import { API_BASE_URL } from "../../config/api";

const MOCK_TEST_API_URL = `${API_BASE_URL}/api/MockTest`;

async function handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// Generate AI Mock Test
export async function generateTest(request) {
    const response = await fetch(`${MOCK_TEST_API_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    return handleResponse(response);
}

// Get Existing Test
export async function getTest(sessionId) {
    const response = await fetch(`${MOCK_TEST_API_URL}/${sessionId}`);

    return handleResponse(response);
}

// Submit Test
export async function submitTest(sessionId, answers) {
    const response = await fetch(
        `${MOCK_TEST_API_URL}/submit/${sessionId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answers,
            }),
        }
    );

    return handleResponse(response);
}

// Clear Session
export async function clearSession(sessionId) {
    const response = await fetch(`${MOCK_TEST_API_URL}/${sessionId}`, {
        method: "DELETE",
    });

    return handleResponse(response);
}