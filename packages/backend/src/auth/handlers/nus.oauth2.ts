import axios from "axios"
import jwt from "jsonwebtoken";

const HANDLER_NAME = 'NUS_OAUTH2';
const BASE_URL = 'https://luminus.nus.edu.sg/v2/api/login/adfstoken';
const GRANT_TYPE = "authorization_code";
const CLIENT_ID = "INC000002767827";
const RESOURCE = "sg_edu_nus_oauth";
const TOKEN_EMAIL_ADDRESS_KEY = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"

async function handleLogin(code: string, callbackUrl: string) {
    const data = new URLSearchParams();
    data.append('grant_type', GRANT_TYPE);
    data.append('client_id', CLIENT_ID);
    data.append('resource', RESOURCE);
    data.append('code', code);
    data.append('redirect_uri', callbackUrl);

    const config = {
        method: 'post',
        url: BASE_URL,
        data
      };
      

      const token = await axios(config);
      if (!token.data.access_token) {
        throw new Error("Error while fetching token from server");
      }

      const decodedToken = jwt.decode(token.data.access_token, {json : true});
      if (!decodedToken) {
        throw new Error("Error while decoding access token");
      }

      return decodedToken[TOKEN_EMAIL_ADDRESS_KEY];
}

export default {
    HANDLER_NAME,
    handleLogin
}