import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Mail, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export const ShareDialog = ({ open, onOpenChange, product }: ShareDialogProps) => {
  const productUrl = `${window.location.origin}/product/${product.id}`;
  
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-green-500/10 hover:text-green-600",
      action: () => {
        const message = `Check out ${product.name} for ${product.price} BHD! ${productUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "hover:bg-blue-500/10 hover:text-blue-600",
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "hover:bg-sky-500/10 hover:text-sky-600",
      action: () => {
        const tweetText = `Check out ${product.name} for ${product.price} BHD!`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(productUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Copy Link",
      icon: Link2,
      color: "hover:bg-purple-500/10 hover:text-purple-600",
      action: async () => {
        try {
          await navigator.clipboard.writeText(productUrl);
          toast.success("Link copied to clipboard!");
          onOpenChange(false);
        } catch (error) {
          toast.error("Failed to copy link");
        }
      }
    },
    {
      name: "Email",
      icon: Mail,
      color: "hover:bg-orange-500/10 hover:text-orange-600",
      action: () => {
        const subject = `Check out ${product.name}`;
        const body = `I found this amazing product:\n\n${product.name}\nPrice: ${product.price} BHD\n\n${productUrl}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Product</DialogTitle>
          <DialogDescription>
            Share this product with your friends and family
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.price} BHD</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`flex flex-col gap-2 h-auto py-4 transition-colors ${option.color}`}
                  onClick={option.action}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
