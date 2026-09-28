import { Form, Head, Link, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function New() {
  const { t } = useTranslation();
  const { flash } = usePage();

  return (
    <div className="mx-auto max-w-sm">
      <Head title={t("sessions.new.title")} />

      <h1>{t("sessions.new.title")}</h1>

      {flash.alert && <p className="text-destructive">{flash.alert}</p>}
      {flash.notice && <p className="text-green-600">{flash.notice}</p>}

      <Form action="/session" method="post" resetOnError={["password"]}>
        {({ processing }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email_address">
                {t("sessions.new.email_address")}
              </FieldLabel>
              <Input
                type="email"
                name="email_address"
                id="email_address"
                required
                autoFocus
                autoComplete="username"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                {t("sessions.new.password")}
              </FieldLabel>
              <Input
                type="password"
                name="password"
                id="password"
                required
                autoComplete="current-password"
                maxLength={72}
              />
            </Field>

            <div>
              <Button type="submit" disabled={processing}>
                {t("sessions.new.submit")}
              </Button>
            </div>
          </FieldGroup>
        )}
      </Form>

      <br />

      <div>
        <Link href="/passwords/new">{t("sessions.new.forgot_password")}</Link>
      </div>

      <div>
        <Link href="/registration/new">{t("sessions.new.sign_up")}</Link>
      </div>
    </div>
  );
}
