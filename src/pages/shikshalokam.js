import { useEffect } from "react";
import Login from "../components/Login";



function Shikshalokam({type, variant}) {

	useEffect(() => {
		document.cookie.split(";").forEach((cookie) => {
			const name = cookie.split("=")[0].trim();
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	}, []);

	return (
		<Login type={type || "shikshalokam"} variant={variant || ""}/>
	);
}

export default Shikshalokam;
