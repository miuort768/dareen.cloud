
/**
 * WhatsApp Message Utility
 * Generates formatted WhatsApp links based on custom templates
 */

interface MessageData {
    Student: string;
    Subject: string;
    Teacher: string;
    Date: string;
    Price: string;
    [key: string]: string;
}

export const generateWhatsAppLink = (phone: string, template: string, data: MessageData) => {
    let message = template;
    
    // Replace placeholders {Tag} with actual data
    Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        message = message.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    // Ensure phone starts with country code and has no plus/spaces
    const cleanPhone = phone.replace(/\D/g, '');
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
