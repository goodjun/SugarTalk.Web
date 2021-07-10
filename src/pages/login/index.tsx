import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import * as styles from "./index.styles";
import queryString from "query-string";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const history = useHistory();

  const onSubmit = (data: any) => {
    history.push({
      pathname: "/meeting",
      search: queryString.stringify(data),
    });
  };

  return (
    <div style={styles.root}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.formItem}>
          <input
            placeholder="username"
            {...register("username", { required: true })}
            defaultValue="TomLee"
          />
          <span style={styles.formError}>
            {errors.username && "username is required"}
          </span>
        </div>
        <div style={styles.formItem}>
          <input
            placeholder="meeting number"
            {...register("meetingNumber", { required: true })}
            defaultValue="35507"
          />
          <span style={styles.formError}>
            {errors.username && "meeting number is required"}
          </span>
        </div>
        <div style={styles.formItem}>
          <input
            placeholder="google token"
            {...register("token", { required: true })}
            defaultValue=""
          />
          <span style={styles.formError}>
            {errors.username && "google token is required"}
          </span>
        </div>
        <div style={styles.formItem}>
          <button type="submit">enter room</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
