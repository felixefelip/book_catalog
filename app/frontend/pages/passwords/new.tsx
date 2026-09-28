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
      <Head title={t("passwords.new.title")} />

      <h1>{t("passwords.new.title")}</h1>

      {flash.alert && <p className="text-destructive">{flash.alert}</p>}

      <Form action="/passwords" method="post">
        {({ processing }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email_address">
                {t("passwords.new.email_address")}
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

            <div>
              <Button type="submit" disabled={processing}>
                {t("passwords.new.submit")}
              </Button>
            </div>
          </FieldGroup>
        )}
      </Form>

      <br />

      <div>
        <Link href="/session/new">{t("passwords.new.back")}</Link>
      </div>
    </div>
  );
}
