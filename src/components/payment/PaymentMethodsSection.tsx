import React from "react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/SectionHeading";

export const PaymentMethodsSection = () => {
  const paymentMethods = [
    { name: "Credit / Debit Card", description: "Visa, Mastercard — instant, worldwide" },
    { name: "Bank Transfer", description: "Direct transfer in supported countries" },
    { name: "Mobile Money", description: "M-Pesa, MTN, Orange — pay from your phone" },
  ];

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <SectionHeading
          title="Payment Methods"
          subtitle="Flexible payment options available worldwide"
          description="We support card payments, bank transfers, and mobile money through Paystack — the most trusted payment processor across Africa."
          className="text-center mb-12"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {paymentMethods.map((method, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <h3 className="font-semibold mb-2">{method.name}</h3>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All payments are secured by Paystack. Card numbers never touch our servers — we only receive the payment confirmation.
          </p>
        </div>
      </div>
    </section>
  );
};
