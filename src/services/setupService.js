// frontend/src/services/setupService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SetupService {
  constructor(modelType) {
    this.modelType = modelType;
    this.baseURL = `${API_URL}/${modelType}s`;
  }

  async getAll(params = {}) {
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }

  async getById(id) {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data) {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id, data) {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await axios.delete(`${this.baseURL}/${id}`);
    return response.data;
  }
}

export default SetupService;