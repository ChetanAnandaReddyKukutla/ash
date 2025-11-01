import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, Grid, Button, TextField, MenuItem, Alert, Stack } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';

const ManufacturerComplaints = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch products for current manufacturer
      const productsRes = await axios.get(`/company-products/${auth.user}`);
      const productList = productsRes.data || [];
      setProducts(productList);
      const productSerials = productList.map(p => p.serialnumber);
      // Fetch ALL complaints
      const complaintsRes = await axios.get('/complaints');
      // Only include complaints about this manufacturer's products
      const filtered = complaintsRes.data.filter(c => productSerials.includes(c.product_id));
      setComplaints(filtered);
      setSelectedComplaint(prev => {
        if (!prev) return prev;
        const refreshed = filtered.find((c) => c.id === prev.id);
        if (!refreshed) return prev;
        const productMatch = productList.find((p) => p.serialnumber === refreshed.product_id);
        return { ...refreshed, product: productMatch };
      });
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  // Helper to fetch product details by id
  const getProduct = (serial) => products.find(p => p.serialnumber === serial);

  const openComplaintDetails = (complaint, product) => {
    setSelectedComplaint({ ...complaint, product });
    setUpdateStatus(complaint.status || 'Open');
    setUpdateFeedback(null);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !selectedComplaint.id || !updateStatus) return;
    setUpdateSubmitting(true);
    setUpdateFeedback(null);
    try {
      await axios.put(`/update-complaint-status/${selectedComplaint.id}`, { status: updateStatus });
      setUpdateFeedback({ type: 'success', message: 'Complaint status updated.' });
      await loadData();
    } catch (err) {
      setUpdateFeedback({ type: 'error', message: 'Failed to update status. Please try again.' });
    } finally {
      setUpdateSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedComplaint?.status) {
      setUpdateStatus(selectedComplaint.status);
    }
  }, [selectedComplaint]);

  return (
    <Box sx={{ maxWidth: '1000px', margin: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{display: 'flex', alignItems:'center', mb:3}}>
            <ReportIcon color="error" sx={{mr:1}}/>
            <Typography variant="h5" sx={{fontWeight:'bold'}}>Product Complaints</Typography>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <CircularProgress />
              <Typography variant="body2">Loading complaints...</Typography>
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : complaints.length === 0 ? (
            <Typography color="text.secondary">No complaints for your products yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Proof</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Complainant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((c) => {
                  const prod = getProduct(c.product_id);
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Tooltip title={prod ? `${prod.name} (${prod.brand})` : c.product_id}>
                          <span>{prod ? `${prod.name}` : c.product_id}</span>
                        </Tooltip>
                        {prod && <><br/><Chip label={prod.brand} size="small" sx={{mt:0.5}} /></>}
                      </TableCell>
                      <TableCell>{c.complaint_type || '-'}</TableCell>
                      <TableCell>{c.description}</TableCell>
                      <TableCell>{c.location ? <Tooltip title={c.location}><span>{c.location.length > 24 ? `${c.location.slice(0, 21)}…` : c.location}</span></Tooltip> : <Typography variant="body2" color="text.secondary">—</Typography>}</TableCell>
                      <TableCell>
                        {c.evidence ? (
                          <Button
                            size="small"
                            component="a"
                            href={`${axios.defaults.baseURL || ''}/uploads/complaint/${c.evidence}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell><Chip label={c.status} color={c.status === 'Open' ? 'error' : 'warning'} size='small' /></TableCell>
                      <TableCell>{c.complainant}</TableCell>
                      <TableCell>{c.created_at ? c.created_at.slice(0,10) : '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton onClick={()=>openComplaintDetails(c, prod)}><VisibilityIcon/></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Complaint Details Dialog */}
      <Dialog open={!!selectedComplaint} onClose={()=>setSelectedComplaint(null)} maxWidth="md" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Grid container spacing={3} sx={{mt:1}}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold' }}>Product:</Typography>
                <Typography variant="body2">{selectedComplaint.product ? selectedComplaint.product.name : selectedComplaint.product_id}</Typography>
                {selectedComplaint.product && <>
                  <Typography variant="body2">Brand: {selectedComplaint.product.brand}</Typography>
                  <Typography variant="body2">Serial: {selectedComplaint.product.serialnumber}</Typography>
                </>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold' }}>Complainant:</Typography>
                <Typography variant="body2">{selectedComplaint.complainant}</Typography>
                <Typography variant="body2">{selectedComplaint.created_at ? selectedComplaint.created_at.slice(0,10) : '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold', mt:2 }}>Type:</Typography>
                <Typography variant="body2">{selectedComplaint.complaint_type}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold', mt:2 }}>Status:</Typography>
                <Typography variant="body2">{selectedComplaint.status}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold', mt:2 }}>Location:</Typography>
                <Typography variant="body2">{selectedComplaint.location || 'Not provided'}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold', mt:2 }}>Description:</Typography>
                <Typography variant="body1">{selectedComplaint.description}</Typography>
                {selectedComplaint.evidence && (
                  <Box sx={{ mt:2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight:'bold' }}>Proof Image:</Typography>
                    <Box sx={{ mt:1 }}>
                      <img
                        src={`${axios.defaults.baseURL || ''}/uploads/complaint/${selectedComplaint.evidence}`}
                        alt="Complaint evidence"
                        style={{ maxWidth: '100%', borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mt: 2 }}>
                  <TextField
                    select
                    label="Update Status"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    sx={{ minWidth: 200 }}
                    size="small"
                    disabled={updateSubmitting}
                  >
                    {['Open', 'In Progress', 'Resolved', 'Rejected'].map((statusValue) => (
                      <MenuItem key={statusValue} value={statusValue}>{statusValue}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={handleStatusUpdate}
                    disabled={updateSubmitting || !updateStatus}
                  >
                    {updateSubmitting ? 'Updating...' : 'Save Status'}
                  </Button>
                </Stack>
                {updateFeedback && (
                  <Alert severity={updateFeedback.type} sx={{ mt: 2 }}>
                    {updateFeedback.message}
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ManufacturerComplaints;
