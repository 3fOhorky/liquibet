import React from 'react';
import { Link } from "react-router-dom";

function SmallSftCard({id, imgSrc}) {
  return (
    <div class="sft-small-card inline-block mx-4">
      <img src={imgSrc} width="180" class="mb-1" />
      <Link to={`/sft/${id}`} className="p-1">View details</Link>
    </div>
  )
}

export default SmallSftCard