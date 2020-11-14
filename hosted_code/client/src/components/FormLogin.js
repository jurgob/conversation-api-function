import { useForm } from "react-hook-form";

function FormLogin({ onSubmit }) {
    const { register, handleSubmit, errors } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="username">User Name</label>

            {/* use aria-invalid to indicate field contain error */}
            <input
                type="text"
                id="username"
                name="username"
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
        </form>
    )
}

export default FormLogin