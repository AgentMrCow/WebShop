// @/app/(component)/BootstrapNext.tsx
"use client"

import { useEffect } from 'react'


function BootstrapNext() {

    useEffect(() => {
        if (typeof window !== "undefined") {
            require("bootstrap/dist/js/bootstrap.bundle.min.js");
        }
    }, []);

    return null;
}



export default BootstrapNext