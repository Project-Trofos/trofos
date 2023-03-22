import React, { useEffect, useRef } from "react";
import { message } from "antd";
import { useNavigate } from 'react-router-dom';
import { useOauth2LoginMutation } from "../api/auth";
import { OAuth2Payload } from "../api/types";

export default function Callback() : JSX.Element {

    const navigate = useNavigate();
    const [OAuth2Login] = useOauth2LoginMutation();
    const isFirstRender = useRef(true);


    const handleOAuth2 = async (searchParams : URLSearchParams, callbackUrl : string) => {
        const code = searchParams.get("code");
        const state = searchParams.get('state');
        if (code && state) {
            const payload : OAuth2Payload = {
                code,
                state,
                callbackUrl
            }
            try {
                await OAuth2Login(payload).unwrap();
                return navigate("/");
            } catch (err) {
                console.error(err);
            }   
        }
        message.error("Something went wrong while signing in.");
        return navigate("/login");
    }

    useEffect(() => {
        // Needed to prevent multiple API calls when component re-renders
        if (isFirstRender.current) {
            isFirstRender.current = false;
            const url = new URL(window.location.href);
            const callbackUrl = `${url.host}${url.pathname}`;
            const { pathname, searchParams} = url;
    
            // There are only a few types of sso workflows so an if-else block would suffice
            if (pathname.includes("oauth2")) {
                handleOAuth2(searchParams, callbackUrl);
            } else {
                message.error("SSO return type not supported");
                navigate("/login")
            }
        }
    }, [])


    return (
        <main style={{ padding: '1rem' }}>
        <p>redirecting...</p>
      </main>
    )
}
