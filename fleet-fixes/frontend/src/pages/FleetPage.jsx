import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './../components/Layout';
import { Card, Button, Input, Modal, Spinner, LoadingState, EmptyState, Pagination, Badge } from '../components/UI';
import { useVehicleStore } from '../store';
import { vehicleService } from '../services/api';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const statusBadges = {
  active: 'active',
  idle: 'idle',
  maintenance: 'maintenance',
  deployed: 'deployed',
};

export const FleetPage = () => {
  const navigate = useNavigate();
  const { vehicles, loading, setVehicles, setLoading } = useVehicleStore();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    loadVehicles();
  }, [page, filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll(page, 20, filters);
      setVehicles(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      toast.success('Vehicle deleted');
      loadVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rajdhani text-amber-400">Fleet Management</h1>
            <p className="text-slate-400">Total: {vehicles.length} vehicles</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>

        <Card className="flex gap-4 flex-wrap">
          <Input
            placeholder="Search vehicles..."
            className="flex-1 min-w-[200px]"
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <select
            className="input min-w-[150px]"
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="deployed">Deployed</option>
          </select>
        </Card>

        {loading ? (
          <LoadingState />
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No Vehicles"
            description="Start by adding your first vehicle to the fleet"
            action={<Button onClick={() => setShowAddModal(true)}>Add Vehicle</Button>}
          />
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Plate</th>
                      <th>Make / Model</th>
                      <th>Status</th>
                      <th>Last Ping</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <span className="font-mono text-amber-400">
                            {String(vehicle.id).slice(0, 8)}
                          </span>
                        </td>
                        <td>{vehicle.plate_number || vehicle.plateNumber || '—'}</td>
                        <td>{[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}</td>
                        <td>
                          <Badge variant={statusBadges[vehicle.status] || 'default'}>
                            {vehicle.status}
                          </Badge>
                        </td>
                        {/* FIXED: null-safe lastPing — new vehicles have no ping yet */}
                        <td className="text-slate-400">
                          {vehicle.lastPing
                            ? new Date(vehicle.lastPing).toLocaleTimeString()
                            : '—'}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/fleet/${vehicle.id}`)}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="p-1 hover:bg-red-900 text-red-400 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Pagination page={page} totalPages={totalPages} onChangePage={setPage} />
          </>
        )}

        <AddVehicleModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            loadVehicles();
          }}
        />
      </div>
    </Layout>
  );
};

const AddVehicleModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await vehicleService.create(data);
      toast.success('Vehicle added');
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add vehicle');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vehicle" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Plate Number" {...register('plate_number')} required />
        <Input label="Make" {...register('make')} />
        <Input label="Model" {...register('model')} />
        <Input label="Year" {...register('year')} type="number" min="1900" max={new Date().getFullYear() + 1} />
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
