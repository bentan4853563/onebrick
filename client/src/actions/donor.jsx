import api from "../utils/api";
import { setDonorInfo } from "../features/donor/donorSlice";
import { clearLoading, setLoading } from "../features/loading/loadingSlice";

export const insertDonor = (donoData) => async (dispatch) => {
	try {
		dispatch(setLoading());
		await api.post("/donor/insert", donoData).then(() => {
			dispatch(clearLoading());
		});
	} catch (e) {
		console.log(e);
	}
};

export const getDonor = (user) => async (dispatch) => {
	try {
		dispatch(setLoading());
		await api
			.post("/donor/get-donor", user)
			.then((res) => {
				console.log("res.data", res.data);
				dispatch(setDonorInfo(res.data));
				dispatch(clearLoading());
			})
			.catch((e) => console.log(e));
	} catch (e) {
		console.log(e);
	}
};
