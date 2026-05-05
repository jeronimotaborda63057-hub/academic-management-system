import { useState, useEffect } from "react";

export default function Demo() {

    useEffect(() => {
        console.log("Se cargó la página");
    }, []);

    return (<div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h1 className="text-4xl font-bold">¡Bienvenido a la página de demostración!</h1>
        </div>
    );
}