import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, List, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "../utils/abi";

const EmployeeManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const contractInstance = new Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contractInstance);
          fetchEmployees(contractInstance);
        } catch (error) {
          console.error("Error initializing provider:", error);
          message.error("Error initializing provider.");
        }
      } else {
        message.error("Please install MetaMask to use this feature.");
      }
    };
    init();
  }, []);

  const fetchEmployees = async (contractInstance) => {
    try {
      setLoading(true);
      const [names, addrs] = await contractInstance.getEmployees();
      if (!names || names.length === 0) {
        throw new Error("No employees found or empty data returned.");
      }
      const employeesData = names.map((name, index) => ({
        name,
        addr: addrs[index],
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      message.error("Error fetching employees.");
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleAddEmployee = async (values) => {
    const { address, name } = values;
    try {
      const tx = await contract.addEmployee(address, name);
      await tx.wait();
      message.success("Employee added successfully!");
      setIsModalVisible(false);
      fetchEmployees(contract);
    } catch (error) {
      console.error("Error adding employee:", error);
      message.error("Error adding employee. Make sure you are the admin.");
    }
  };

  return (
    <div className="employee-management">
      <Typography.Title level={2} className="title">
        Employee Management
      </Typography.Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showModal}
        style={{ marginBottom: "20px" }}
      >
        Add New Employee
      </Button>

      <Modal
        title="Add New Employee"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleAddEmployee}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="address"
            label="Employee Address"
            rules={[
              {
                required: true,
                message: "Please input the employee's address!",
              },
            ]}
          >
            <Input placeholder="0x..." />
          </Form.Item>
          <Form.Item
            name="name"
            label="Employee Name"
            rules={[
              { required: true, message: "Please input the employee's name!" },
            ]}
          >
            <Input placeholder="Employee Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Typography.Title level={4} className="title">
        Employee List
      </Typography.Title>
      <List
        loading={loading}
        dataSource={employees}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text>{item.name}</Typography.Text> -{" "}
            <Typography.Text>{item.addr}</Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );
};

export default EmployeeManagement;
