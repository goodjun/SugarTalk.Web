export const checkMediaAccess = async (): Promise<{
  video: boolean;
  audio: boolean;
}> => {
  let video = false;
  let audio = false;

  const devices = await navigator.mediaDevices.enumerateDevices();

  devices.forEach((device) => {
    if (device.kind === "videoinput" && device.label) video = true;
    if (device.kind === "audioinput" && device.label) audio = true;
  });

  return { video, audio };
};
