import axios from "axios";
class Http {
  GetRequest = async (relativeUrl: string, config?: any) => {
    const response = await axios.get(relativeUrl, config);
    return {
      data: response.data,
      status: response.status
    };
  };
  PostRequest = async (relativeUrl: string, data: any, config?: any) => {
    const response = await axios.post(relativeUrl, data, config);
    return {
      data: response.data,
      status: response.status
    };
  };

  PutRequest = async (relativeUrl: string, data: any, config?: any) => {
    const response = await axios.put(relativeUrl, data, config);
    return {
      data: response.data,
      status: response.status
    };
  };
}

export default Http;
