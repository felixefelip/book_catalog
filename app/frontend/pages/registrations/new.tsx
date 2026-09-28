import { Form, Head, Link, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toFieldErrors } from "@/lib/field_errors";

type RegistrationFormType = {
  name: string;
  last_name: string;
  email_address: string;
  password: string;
  password_confirmation: string;
};

export default function New() {
  const { t } = useTranslation();
  const { flash } = usePage();

  return (
    <div className="mx-auto max-w-sm">
      <Head title={t("registrations.new.title")} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{t("registrations.new.title")}</h1>
          </CardTitle>
          <CardDescription>
            {t("registrations.new.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {flash.alert && <p className="text-destructive">{flash.alert}</p>}

          <Form<RegistrationFormType>
            action="/registration"
            method="post"
            resetOnError={["password", "password_confirmation"]}
          >
            {({ errors, processing }) => (
              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">
                    {t("registrations.new.name")}
                  </FieldLabel>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    required
                    autoFocus
                    autoComplete="given-name"
                    aria-invalid={!!errors.name}
                  />
                  <FieldError errors={toFieldErrors(errors.name)} />
                </Field>

                <Field data-invalid={!!errors.last_name}>
                  <FieldLabel htmlFor="last_name">
                    {t("registrations.new.last_name")}
                  </FieldLabel>
                  <Input
                    type="text"
                    name="last_name"
                    id="last_name"
                    required
                    autoComplete="family-name"
                    aria-invalid={!!errors.last_name}
                  />
                  <FieldError errors={toFieldErrors(errors.last_name)} />
                </Field>

                <Field data-invalid={!!errors.email_address}>
                  <FieldLabel htmlFor="email_address">
                    {t("registrations.new.email_address")}
                  </FieldLabel>
                  <Input
                    type="email"
                    name="email_address"
                    id="email_address"
                    required
                    autoComplete="username"
                    aria-invalid={!!errors.email_address}
                  />
                  <FieldError errors={toFieldErrors(errors.email_address)} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">
                    {t("registrations.new.password")}
                  </FieldLabel>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    aria-invalid={!!errors.password}
                  />
                  <FieldError errors={toFieldErrors(errors.password)} />
                </Field>

                <Field data-invalid={!!errors.password_confirmation}>
                  <FieldLabel htmlFor="password_confirmation">
                    {t("registrations.new.password_confirmation")}
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
                  <FieldError
                    errors={toFieldErrors(errors.password_confirmation)}
                  />
                </Field>

                <div>
                  <Button type="submit" disabled={processing}>
                    {t("registrations.new.submit")}
                  </Button>
                </div>
              </FieldGroup>
            )}
          </Form>
        </CardContent>
        <CardFooter>
          <Link href="/session/new">{t("registrations.new.sign_in")}</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
