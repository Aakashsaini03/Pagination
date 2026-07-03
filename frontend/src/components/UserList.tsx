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

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const fetchUsers = async (
  page: number,
  searchName: string = name,
  searchEmail: string = email,
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("pageSize", '5');

    if (searchName.trim() !== "") {
      params.append("name", searchName.trim());
    }

    if (searchEmail.trim() !== "") {
      params.append("email", searchEmail.trim());
    }

    const response = await fetch(
      `http://localhost:3000/users?${params.toString()}`
    );

    const data: ApiResponse = await response.json();

    console.log(data);

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

const handleSearch = () => {
  setCurrentPage(1);
  fetchUsers(1, name, email);
};

const handleClear = () => {
  setName("");
  setEmail("");
  setCurrentPage(1);
  fetchUsers(1, "", "");
};
  

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
      <h1>User Pagination With Filter</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <input
          type="text"
          placeholder="Search by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <button onClick={handleSearch}>Search</button>

        <button onClick={handleClear} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>

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
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No users found</td>
            </tr>
          )}
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