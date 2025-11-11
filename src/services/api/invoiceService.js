import invoiceData from "@/services/mockData/invoices.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let invoices = [...invoiceData];

const invoiceService = {
  async getAll() {
    await delay(350);
    return [...invoices];
  },

  async getById(id) {
    await delay(200);
    const invoice = invoices.find(invoice => invoice.Id === id);
    if (!invoice) {
      throw new Error(`Invoice with Id ${id} not found`);
    }
    return { ...invoice };
  },

  async create(invoiceData) {
    await delay(500);
    const newInvoice = {
      Id: Math.max(...invoices.map(i => i.Id)) + 1,
      ...invoiceData,
      issuedAt: new Date().toISOString()
    };
    invoices.push(newInvoice);
    return { ...newInvoice };
  },

  async update(id, updatedData) {
    await delay(400);
    const index = invoices.findIndex(invoice => invoice.Id === id);
    if (index === -1) {
      throw new Error(`Invoice with Id ${id} not found`);
    }
    invoices[index] = { ...invoices[index], ...updatedData };
    return { ...invoices[index] };
  },

  async delete(id) {
    await delay(300);
    const index = invoices.findIndex(invoice => invoice.Id === id);
    if (index === -1) {
      throw new Error(`Invoice with Id ${id} not found`);
    }
    const deletedInvoice = invoices[index];
    invoices.splice(index, 1);
    return { ...deletedInvoice };
  }
};

export default invoiceService;