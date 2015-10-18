import './actions';
import './Stores/Commands';
import {setServices} from './Stores/Services';

export default function setup(services) {
  setServices(services);
}
