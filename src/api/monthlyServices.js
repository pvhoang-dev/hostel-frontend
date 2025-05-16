import api from "./axios";

/**
 * Get available houses for service management
 */
export const getAvailableHouses = async () => {
  try {
    const response = await api.get("/monthly-services/houses");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get rooms that need service usage updates for a specific month/year
 */
export const getRoomsNeedingUpdate = async (
  month,
  year,
  houseId = null,
  showAll = false
) => {
  try {
    const params = {
      month,
      year,
      show_all: showAll ? "true" : "false",
    };
    if (houseId) params.house_id = houseId;

    const response = await api.get("/monthly-services/rooms", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get services for a room with their latest usage
 */
export const getRoomServices = async (roomId, month, year) => {
  try {
    const response = await api.get(`/monthly-services/rooms/${roomId}`, {
      params: { month, year },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save monthly service usage for a room
 */
export const saveRoomServiceUsage = async (data) => {
  try {
    const response = await api.post("/monthly-services/save", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
