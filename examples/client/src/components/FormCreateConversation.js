// import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";

function FormCreateConversation({ onSubmit }) {
    const { register, handleSubmit, errors } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="conversation_name">Name</label>

            {/* use aria-invalid to indicate field contain error */}
            <input
                type="text"
                id="conversation_name"
                name="conversation_name"
                aria-invalid={errors.name ? "true" : "false"}
                ref={register({ required: true, maxLength: 30 })}
            />
            <br />
            <label htmlFor="conversation_display_name">Display Name</label>
            <input
                type="text"
                id="conversation_display_name"
                name="conversation_display_name"
                aria-invalid={errors.name ? "true" : "false"}
                ref={register({ required: true, maxLength: 30 })}
            />

            {/* use role="alert" to announce the error message */}
            {errors.name && errors.name.type === "required" && (
                <span role="alert">This is required</span>
            )}
            {errors.name && errors.name.type === "maxLength" && (
                <span role="alert">Max length exceeded</span>
            )}

            <input type="submit" />
            {/* <audio src="https://tribeofnoisestorage.blob.core.windows.net/music/b55104bdd2661122697e23213f1ff211.mp3" controls autoPlay /> */}
        </form>
    )
}

export default FormCreateConversation