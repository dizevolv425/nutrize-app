import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar paciente por nome...",
}) => {
  return (
    <div className="search-bar">
      <FaSearch className="search-bar__icon" />
      <input
        type="text"
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
