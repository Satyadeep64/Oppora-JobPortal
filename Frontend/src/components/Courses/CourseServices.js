import { API_BASE_URL } from "../../config/api";

const API_URL = `${API_BASE_URL}/api/courses`;

export const getAllCourses = async () => {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch courses");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};