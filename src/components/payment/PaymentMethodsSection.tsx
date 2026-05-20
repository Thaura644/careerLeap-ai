
import React from "react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/SectionHeading";

export const PaymentMethodsSection = () => {
  const paymentMethods = [
    { name: "Credit/Debit Cards", logo: "/payment/cards.png", description: "Visa, Mastercard, American Express, Discover, and more" },
    { name: "PayPal", logo: "/payment/paypal.png", description: "Fast and secure payment with your PayPal account" },
    { name: "Apple Pay", logo: "/payment/apple-pay.png", description: "Quick and easy payments on Apple devices" },
    { name: "Google Pay", logo: "/payment/google-pay.png", description: "Seamless payments through your Google account" },
    { name: "Bank Transfer", logo: "/payment/bank-transfer.png", description: "Direct transfer from your bank account" },
    { name: "Mobile Money", logo: "/payment/mobile-money.png", description: "M-Pesa, Orange Money, MTN Mobile Money and more" },
    { name: "Crypto", logo: "/payment/crypto.png", description: "Pay with Bitcoin, Ethereum, and other cryptocurrencies" },
    { name: "Regional Methods", logo: "/payment/regional.png", description: "Alipay, WeChat Pay, SEPA, Boleto and more" }
  ];

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <SectionHeading
          title="Payment Methods"
          subtitle="Flexible payment options available worldwide"
          description="We support various payment methods to ensure you can easily subscribe to our services from anywhere in the world."
          className="text-center mb-12"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentMethods.map((method, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="h-12 w-12 mb-4 flex items-center justify-center">
                <img src={method.logo} alt={method.name} className="max-w-full max-h-full" />
              </div>
              <h3 className="font-semibold mb-2">{method.name}</h3>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All payments are secured with industry-standard encryption and processed through our trusted payment partners.
          </p>
        </div>
      </div>
    </section>
  );
};
