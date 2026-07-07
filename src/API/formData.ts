export type FormValue = string | number | string[];

export const toFormData = (data: Record<string, FormValue>) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(`${key}[]`, item);
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};
