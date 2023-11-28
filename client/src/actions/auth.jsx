import api from '../utils/api';
import { login } from '../features/auth/authSlice';

export const googleRegister = (access_token) => async (dispatch) => {
  try {
    const res = await api.post(
      '/auth/google-register',
      JSON.stringify({ access_token })
    );
    console.log(res.data);
    dispatch(login());
  } catch (e) {
    if (e.response.data['Error'] == 'This user already exists') {
      window.alert('This user already exists');
    } else {
      window.alert('Some error ocurred');
    }
  }
};

export const googleLogin = (access_token) => async (dispatch) => {
  try {
    const res = await api.post(
      '/auth/google-login',
      JSON.stringify({ access_token })
    );
    console.log(res.data);
    dispatch(login());
  } catch (e) {
    window.alert(e);
  }
};