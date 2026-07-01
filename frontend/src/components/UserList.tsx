import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type ApiResponse = {
  currentPage: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  users: User[];
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const fetchUsers = async (page: number): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/users?page=${page}`);

      const data: ApiResponse = await response.json();

      setUsers(data.users);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>User Pagination</h1>

      <h3>
        Page {currentPage} of {totalPages}
      </h3>

      <p>Total Users: {totalUsers}</p>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          width: "700px",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </button>

        <span style={{ margin: "0 15px" }}>
          Current Page: {currentPage}
        </span>

        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default UserList;