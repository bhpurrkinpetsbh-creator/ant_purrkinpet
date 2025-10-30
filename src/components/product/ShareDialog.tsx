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
      color: "text-green-600 hover:bg-green-500/10",
      action: () => {
        const message = `Check out ${product.name} for ${product.price} BHD! ${productUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600 hover:bg-blue-500/10",
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500 hover:bg-sky-500/10",
      action: () => {
        const tweetText = `Check out ${product.name} for ${product.price} BHD!`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(productUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Copy Link",
      icon: Link2,
      color: "text-purple-600 hover:bg-purple-500/10",
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
      color: "text-orange-600 hover:bg-orange-500/10",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Product</DialogTitle>
          <DialogDescription>
            Share this product with your friends and family
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted border shadow-sm">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-2">{product.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{product.price} BHD</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`flex flex-col gap-2 h-auto py-6 transition-all duration-200 ${option.color}`}
                  onClick={option.action}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
