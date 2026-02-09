import { WHATSAPP_PHONE_NUMBER, WHATSAPP_BASE_URL } from '../constants/whatsapp';

/**
 * Generates a WhatsApp click-to-chat URL with optional pre-filled message
 * @param message Optional pre-filled message text
 * @returns WhatsApp deep link URL
 */
export function generateWhatsAppUrl(message?: string): string {
  const url = `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_NUMBER}`;
  
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    return `${url}?text=${encodedMessage}`;
  }
  
  return url;
}

/**
 * Generates a WhatsApp order message from cart items
 * @param items Array of cart items with name, quantity, and price
 * @param total Total amount including fees and tax
 * @returns Formatted order message
 */
export function generateOrderMessage(
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): string {
  let message = 'Hello! I would like to place an order:\n\n';
  
  items.forEach((item) => {
    message += `• ${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += `\nTotal: ₹${total.toFixed(2)}`;
  
  return message;
}
