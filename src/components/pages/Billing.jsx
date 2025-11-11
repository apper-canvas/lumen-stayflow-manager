import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { format } from "date-fns";
import { toast } from "react-toastify";
import invoiceService from "@/services/api/invoiceService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import StatusBadge from "@/components/molecules/StatusBadge";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Billing = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (err) {
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handlePaymentProcess = async (invoice) => {
    try {
      const updatedInvoice = { ...invoice, paymentStatus: "paid" };
      await invoiceService.update(invoice.Id, updatedInvoice);
      setInvoices(invoices.map(inv => inv.Id === invoice.Id ? updatedInvoice : inv));
      toast.success("Payment processed successfully");
    } catch (err) {
      toast.error("Failed to process payment");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadInvoices} />;

  // Filter invoices
  let filteredInvoices = invoices;
  if (statusFilter !== "all") {
    filteredInvoices = filteredInvoices.filter(inv => inv.paymentStatus === statusFilter);
  }
  if (searchQuery) {
    filteredInvoices = filteredInvoices.filter(inv => 
      inv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.Id.toString().includes(searchQuery)
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">Manage invoices and payment processing</p>
        </div>
<Button onClick={() => {
          navigate('/billing/new');
          toast.success('Opening new invoice form...');
        }}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-3xl font-bold">$45,280</p>
            </div>
            <ApperIcon name="DollarSign" className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-success to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Paid Invoices</p>
              <p className="text-3xl font-bold">89</p>
            </div>
            <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-warning to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <ApperIcon name="Clock" className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-error to-red-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Overdue</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by guest name or invoice ID..."
              onSearch={setSearchQuery}
              showButton={false}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </Select>
          </div>
          <Button variant="outline">
            <ApperIcon name="Download" className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filteredInvoices.length === 0 ? (
            <Empty
              title="No invoices found"
              description="No invoices match the current filters."
              icon="CreditCard"
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr 
                        key={invoice.Id} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                          selectedInvoice?.Id === invoice.Id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            INV-{invoice.Id.toString().padStart(4, '0')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(invoice.issuedAt), "MMM dd, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.guestName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room {invoice.roomNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${invoice.totalAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={invoice.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {invoice.paymentStatus === "unpaid" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentProcess(invoice);
                                }}
                              >
                                <ApperIcon name="CreditCard" className="h-3 w-3 mr-1" />
                                Pay
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <ApperIcon name="Eye" className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ApperIcon name="Download" className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedInvoice ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ApperIcon name="FileText" className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invoice Header */}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    INV-{selectedInvoice.Id.toString().padStart(4, '0')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Issued: {format(new Date(selectedInvoice.issuedAt), "MMM dd, yyyy")}
                  </div>
                  <StatusBadge status={selectedInvoice.paymentStatus} className="mt-2" />
                </div>

                {/* Guest Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Guest</h4>
                  <p className="text-sm text-gray-600">{selectedInvoice.guestName}</p>
                  <p className="text-sm text-gray-600">Room {selectedInvoice.roomNumber}</p>
                </div>

                {/* Charges Breakdown */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Charges</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Charges</span>
                      <span>${selectedInvoice.roomCharges.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.serviceCharges.map((service, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{service.name}</span>
                        <span>${service.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${(selectedInvoice.totalAmount - selectedInvoice.tax).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>${selectedInvoice.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedInvoice.paymentStatus === "paid" && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                    <p className="text-sm text-gray-600">Method: {selectedInvoice.paymentMethod}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedInvoice.paymentStatus === "unpaid" && (
                    <Button 
                      className="w-full" 
                      onClick={() => handlePaymentProcess(selectedInvoice)}
                    >
                      <ApperIcon name="CreditCard" className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  )}
                  <Button className="w-full" variant="outline">
                    <ApperIcon name="Download" className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button className="w-full" variant="outline">
                    <ApperIcon name="Printer" className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ApperIcon name="FileText" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select an invoice to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;