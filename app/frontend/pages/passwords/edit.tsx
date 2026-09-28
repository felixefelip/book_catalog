import { Form, Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface EditProps {
  token: string;
}

type PasswordFormType = {
  password: string;
  password_confirmation: string;
};

const toFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }));

export default function Edit({ token }: EditProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-sm">
      <Head title={t("passwords.edit.title")} />

      <h1>{t("passwords.edit.title")}</h1>

      <Form<PasswordFormType>
        action={`/passwords/${token}`}
        method="put"
        resetOnError
      >
        {({ errors, processing }) => (
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">
                {t("passwords.edit.password")}
              </FieldLabel>
              <Input
                type="password"
                name="password"
                id="password"
                required
                autoComplete="new-password"
                maxLength={72}
                aria-invalid={!!errors.password}
              />
              <FieldError errors={toFieldErrors(errors.password)} />
            </Field>

            <Field data-invalid={!!errors.password_confirmation}>
              <FieldLabel htmlFor="password_confirmation">
                {t("passwords.edit.password_confirmation")}
              </FieldLabel>
              <Input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                required
                autoComplete="new-password"
                maxLength={72}
                aria-invalid={!!errors.password_confirmation}
              />
              <FieldError errors={toFieldErrors(errors.password_confirmation)} />
            </Field>

            <div>
              <Button type="submit" disabled={processing}>
                {t("passwords.edit.submit")}
              </Button>
            </div>
          </FieldGroup>
        )}
      </Form>
    </div>
  );
}
