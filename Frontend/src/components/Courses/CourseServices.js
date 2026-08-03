const API_URL = "http://localhost:5024/api/courses";

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