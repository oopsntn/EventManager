import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:9999/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.statistics);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center mt-5 text-danger">Không lấy được dữ liệu</div>
    );
  }

  // Dữ liệu cho BarChart
  const barData = [
    { name: "Events", value: stats.totalEvents },
    { name: "Participants", value: stats.totalParticipants },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">Dashboard Statistics</h3>

      {/* Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h5>Total Users</h5>
              <h3>{stats.totalUsers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h5>Total Events</h5>
              <h3>{stats.totalEvents}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h5>Total Participants</h5>
              <h3>{stats.totalParticipants}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Pie Chart */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-center mb-3">Users by Role</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.usersByRole.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-center mb-3">Events vs Participants</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
