import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import * as styles from "./index.styles";
import queryString from "query-string";
import { AuthContext } from "../../contexts/auth-context";

const JoinMeeting = () => {
  const { idToken } = React.useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const history = useHistory();

  React.useEffect(() => {
    setValue("token", idToken);
  }, [idToken, setValue]);

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
            {errors.meetingNumber && "meeting number is required"}
          </span>
        </div>
        <div style={styles.formItem}>
          <input
            placeholder="google token"
            {...register("token", { required: true })}
          />
          <span style={styles.formError}>
            {errors.token && "google token is required"}
          </span>
        </div>
        <div style={styles.formItem}>
          <button type="submit">enter room</button>
        </div>
      </form>
    </div>
  );
};

export default JoinMeeting;
