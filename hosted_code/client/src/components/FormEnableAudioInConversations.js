
import { useForm } from "react-hook-form";

function FormEnableAudioInConversations({ onSubmit }) {
    const { register, handleSubmit, errors } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="audio_conversation_id">Conversations Id </label>

            {/* use aria-invalid to indicate field contain error */}
            <input
                type="text"
                id="audio_conversation_id"
                name="audio_conversation_id"
                aria-invalid={errors.name ? "true" : "false"}
                defaultValue="CON-71ed48a1-4983-4557-a911-561fcb380d2f"
                ref={register({ required: true, maxLength: 50, })}
            />

            {/* use role="alert" to announce the error message */}
            {errors.name && errors.name.type === "required" && (
                <span role="alert">This is required</span>
            )}
            {errors.name && errors.name.type === "maxLength" && (
                <span role="alert">Max length exceeded</span>
            )}

            <input type="submit" />
        </form>
    )
}

export default FormEnableAudioInConversations;