import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate("/payment");
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="h-20 w-20 text-destructive" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          
          <p className="text-muted-foreground mb-6">
            We couldn't process your payment. This could be due to insufficient funds, 
            incorrect card details, or a network issue.
          </p>

          <div className="bg-muted p-4 rounded-lg mb-8">
            <p className="text-sm font-semibold mb-2">What you can do:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Check your card details and try again</li>
              <li>• Ensure you have sufficient funds</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleRetryPayment}
              className="bg-gradient-hero hover:opacity-90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={handleBackToCart}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailure;