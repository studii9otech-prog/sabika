import { redirect } from "next/navigation";

export default async function PricesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  redirect(`/${locale}`);
}
